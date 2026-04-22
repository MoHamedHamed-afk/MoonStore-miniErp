import http.server
import os
import socketserver

ROOT = r"F:\projects\Dwayne Cloth\Frontend\shop-ui\dist\shop-ui\browser"
PORT = 4200


class SpaHandler(http.server.SimpleHTTPRequestHandler):
    def translate_path(self, path: str) -> str:
        path = path.split("?", 1)[0].split("#", 1)[0]
        relative = path.lstrip("/")

        if not relative:
            return os.path.join(ROOT, "index.html")

        target = os.path.join(ROOT, relative)
        if os.path.exists(target):
            return target

        return os.path.join(ROOT, "index.html")

    def log_message(self, format: str, *args) -> None:
        return


if __name__ == "__main__":
    os.chdir(ROOT)
    with socketserver.TCPServer(("127.0.0.1", PORT), SpaHandler) as server:
        server.serve_forever()
