from bnb import app
from dotenv import load_dotenv
import os

load_dotenv()
print(os.getenv("HBNB_MYSQL_DB"))
print(os.getenv("HBNB_TYPE_STORAGE"))
if __name__ == "__main__":
    """ Main Function """
    host = os.getenv('HBNB_API_HOST')
    port = int(os.getenv('HBNB_API_PORT'))
    print(os.getenv("HBNB_MYSQL_DB"))
    print(port)
    print(os.getenv("HBNB_TYPE_STORAGE"))
    if not host:
        host = '0.0.0.0'
    if not port:
        port = '5000'
    app.run(host=host, port=port, threaded=True)

