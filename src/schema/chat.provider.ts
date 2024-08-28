import { Connection } from 'mongoose';
import { UserSchema } from './user.schema';

export const UserProviders = [
  {
    provide: 'MESSAGE_MODEL',
    useFactory: (connection: Connection) => connection.model('Message', UserSchema),
    inject: ['DATABASE_CONNECTION'],
  },
];