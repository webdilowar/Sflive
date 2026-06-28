import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

interface Channel {
  id: string;
  name: string;
  logo: string;
  url: string;
  category: string;
  country: string;
  isLive: boolean;
  description: string;
}

function parseM3U(m3uText: string): Channel[] {
  const lines = m3uText.split(/\r?\n/);
  const channels: Channel[] = [];
  let currentInfo: {
    name?: string;
    logo?: string;
    groupTitle?: string;
    tvgId?: string;
  } | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    if (line.startsWith("#EXTINF:")) {
      const logoMatch = line.match(/tvg-logo="([^"]+)"/i);
      const groupMatch = line.match(/group-title="([^"]+)"/i);
      const idMatch = line.match(/tvg-id="([^"]+)"/i);
      
      const commaIndex = line.lastIndexOf(",");
      let name = "Unknown Channel";
      if (commaIndex !== -1) {
        name = line.substring(commaIndex + 1).trim();
      }

      currentInfo = {
        name,
        logo: logoMatch ? logoMatch[1] : "",
        groupTitle: groupMatch ? groupMatch[1] : "General",
        tvgId: idMatch ? idMatch[1] : undefined,
      };
    } else if (line.startsWith("#")) {
      // Ignore other M3U directives
    } else {
      if (currentInfo) {
        const cleanName = currentInfo.name || "Channel";
        let idBase = currentInfo.tvgId || cleanName.replace(/[^a-zA-Z0-9]/g, "");
        if (!idBase) {
          idBase = "channel";
        }
        
        let country = "US";
        const lowerName = cleanName.toLowerCase();
        if (idBase.toLowerCase().includes(".bd") || lowerName.includes("bangla") || lowerName.includes("btv") || lowerName.includes("tsports") || lowerName.includes("gazi") || lowerName.includes("somoy") || lowerName.includes("jamuna") || lowerName.includes("ekattor")) {
          country = "BD";
        } else if (idBase.toLowerCase().includes(".pk") || lowerName.includes("pakistan") || lowerName.includes("ptv")) {
          country = "PK";
        } else if (idBase.toLowerCase().includes(".in") || lowerName.includes("star sports") || lowerName.includes("sony sports") || lowerName.includes("dd sports") || lowerName.includes("jalsha") || lowerName.includes("star jalsha")) {
          country = "IN";
        } else if (idBase.toLowerCase().includes(".br") || lowerName.includes("sportv") || lowerName.includes("premiere")) {
          country = "BR";
        } else if (idBase.toLowerCase().includes(".ar") || lowerName.includes("tyc sports")) {
          country = "AR";
        } else if (idBase.toLowerCase().includes(".ca") || lowerName.includes("deshi tv")) {
          country = "CA";
        } else if (lowerName.includes("espn") || lowerName.includes("bein") || lowerName.includes("fox") || lowerName.includes("fubo") || lowerName.includes("nbc") || lowerName.includes("pluto")) {
          country = "US";
        }

        // Map categories dynamically to match SFLIVE's sections
        let category = currentInfo.groupTitle || "General";
        const lowerCat = category.toLowerCase();
        if (lowerCat.includes("sports") || lowerCat.includes("sport") || lowerName.includes("sports") || lowerName.includes("sport") || lowerName.includes("sports1") || lowerName.includes("sports2")) {
          category = "Sports";
        } else if (lowerCat.includes("news") || lowerName.includes("news")) {
          category = "News";
        } else if (lowerCat.includes("movie") || lowerCat.includes("cinema") || lowerName.includes("movie") || lowerName.includes("movies") || lowerName.includes("jalsha movies")) {
          category = "Movies";
        } else if (lowerCat.includes("kids") || lowerCat.includes("cartoon") || lowerName.includes("disney") || lowerName.includes("duronto")) {
          category = "Kids";
        } else if (lowerCat.includes("music") || lowerName.includes("music") || lowerName.includes("8xm") || lowerName.includes("global tv")) {
          category = "Music";
        } else if (country === "BD" && (lowerName.includes("bangla") || lowerName.includes("atn") || lowerName.includes("channel") || lowerName.includes("deepto") || lowerName.includes("ntv") || lowerName.includes("rtv") || lowerName.includes("gazi") || lowerName.includes("boishakhi"))) {
          category = "Bangla";
        } else if (country === "IN" && (lowerName.includes("star") || lowerName.includes("jalsha") || lowerName.includes("hindi") || lowerName.includes("sony"))) {
          category = "Hindi";
        } else if (category === "General" || lowerCat.includes("entertainment") || lowerCat.includes("general")) {
          category = country === "BD" ? "Bangla" : "English";
        }

        channels.push({
          id: `${idBase.replace(/[^a-zA-Z0-9_.-]/g, "")}_${channels.length}`,
          name: cleanName,
          logo: currentInfo.logo || "",
          url: line,
          category,
          country,
          isLive: true,
          description: `Live streaming from playlist: ${cleanName}`,
        });
        currentInfo = null;
      }
    }
  }
  return channels;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Endpoint to fetch and parse M3U files
  app.get("/api/playlist", async (req, res) => {
    const playlistUrl = req.query.url as string;
    
    // Default URL requested by the user
    const urlToFetch = playlistUrl || "https://go.skym3u.top/2k8o.m3u";

    try {
      console.log(`Fetching playlist from: ${urlToFetch}`);
      const response = await fetch(urlToFetch, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch playlist: ${response.statusText}`);
      }

      const text = await response.text();
      const parsedChannels = parseM3U(text);
      
      res.json({
        success: true,
        url: urlToFetch,
        channels: parsedChannels
      });
    } catch (error: any) {
      console.error("Error loading playlist:", error.message);
      res.status(500).json({
        success: false,
        error: error.message || "Failed to load and parse playlist"
      });
    }
  });

  // Endpoint to proxy live streams and prevent mixed content / CORS blocks in the browser
  app.get("/api/stream", async (req, res) => {
    const streamUrl = req.query.url as string;
    if (!streamUrl) {
      return res.status(400).send("Stream URL is required");
    }

    try {
      const headers: Record<string, string> = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
      };

      // Forward client Range headers to support seek/buffer in video player
      if (req.headers.range) {
        headers["Range"] = req.headers.range;
      }

      const controller = new AbortController();
      req.on("close", () => {
        controller.abort();
      });

      const response = await fetch(streamUrl, {
        signal: controller.signal,
        headers
      });

      // Forward response status code (e.g. 200 OK or 206 Partial Content)
      res.status(response.status);

      // Forward important response headers
      const headersToForward = [
        "content-type",
        "content-length",
        "content-range",
        "accept-ranges",
        "cache-control",
        "expires"
      ];

      headersToForward.forEach(headerName => {
        const value = response.headers.get(headerName);
        if (value) {
          res.setHeader(headerName, value);
        }
      });

      // Default content-type for media streaming if missing
      if (!res.getHeader("content-type")) {
        res.setHeader("content-type", "video/mp2t");
      }

      // Stream the response body
      if (response.body) {
        const { Readable } = await import("stream");
        const nodeStream = Readable.fromWeb(response.body as any);
        nodeStream.pipe(res);
      } else {
        res.end();
      }
    } catch (error: any) {
      if (error.name === "AbortError") {
        // Safe to ignore client disconnects
        return;
      }
      console.error(`Stream proxy error for ${streamUrl}:`, error.message);
      if (!res.headersSent) {
        res.status(500).send("Streaming error");
      }
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
