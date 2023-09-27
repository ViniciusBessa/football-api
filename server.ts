import app from './app';

const port = process.env.PORT || 5000;
const url = process.env.URL || 'http://ocalhost';

app.listen(port, () => console.log(`The server is running on: ${url}:${port}`));
