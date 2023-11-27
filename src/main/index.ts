import { app } from './express-app';
import { connectdb } from './mongo-utils';
const MONGO_URI = process.env.MONGO_URI;

// Starting the server
try {
  connectdb(MONGO_URI as string);
  app.listen(app.get('port'), () => {
    console.log(`Server is running on port ${app.get('port')}`);
  });
} catch (e) {
  if (typeof e === 'string') {
    console.log(e.toUpperCase()); // works, `e` narrowed to string
  } else if (e instanceof Error) {
    console.log(e.message); // works, `e` narrowed to Error
  }
}
