import app from './app';

const port = process.env.PORT || 5000;
const url = process.env.URL || 'http://127.0.0.1';

app.listen(port, () => console.log(`The server is running on: ${url}:${port}`));
