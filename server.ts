import app from './app';

const port = Bun.env.PORT || 5000;
const url = Bun.env.URL || 'http://127.0.0.1';

app.listen(port, () => console.log(`The server is running on: ${url}:${port}`));
