"""Serve Expo's exported HTML routes for local browser verification."""

import argparse
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlsplit


class ExpoExportHandler(SimpleHTTPRequestHandler):
    def do_GET(self):
        path = urlsplit(self.path).path
        if path != "/" and not Path(path).suffix:
            self.path = f"{path}.html"
        super().do_GET()


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("directory")
    parser.add_argument("--port", type=int, default=8084)
    args = parser.parse_args()
    directory = str(Path(args.directory).resolve())
    handler = partial(ExpoExportHandler, directory=directory)
    server = ThreadingHTTPServer(("127.0.0.1", args.port), handler)
    print(f"Local export ready at http://localhost:{args.port}", flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()
