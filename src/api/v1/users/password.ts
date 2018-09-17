import * as Hapi from 'hapi';
import * as Boom from 'boom';
import * as Joi from 'joi';
import { hash } from 'bcrypt';
import { User, Users } from '../../../models';
import {
  response,
  email as emailSchema,
  password as passwordSchema,
} from './schema';
import { EmailTemplate } from '../../../services/email/templates';


interface ForgotPasswordRequest extends Hapi.Request {
  payload: {
    email: string
  };
}

interface ResetPasswordRequest extends Hapi.Request {
  payload: {
    token: string
    password: string
    confirmPassword: string
  };
}

const routes: Hapi.ServerRoute[] = [
  {
    method: 'POST',
    path: '/users/password/forgot',
    options: {
      description: 'Send password reset link for a single user',
      auth: false,
      validate: {
        payload: { email: emailSchema },
      },
      response: { schema: response },
    },
    handler: async (request: ForgotPasswordRequest, h: Hapi.ResponseToolkit) => {
      const { server: { app: { knex, EmailService } }, payload: { email } } = request;
      const exists = await Users.exists(knex, { where: { email } });

      if (!exists) return Boom.badRequest('E-mail not recognised');

      const { token } = await Users.createPasswordResetToken(knex, { email });

      try {
        await EmailService.send({
          from: 'visitorapp@powertochange.org.uk',
          to: email,
          templateId: EmailTemplate.USER_PASSWORD_RESET,
          templateModel: { email, token },
        });
      } catch (error) {
        /*
         * we should do something meaningful here!
         * such as retry with backoff and log/email
         * dev team if unsuccessful
         */
        return Boom.badGateway('E-mail service unavailable');
      }
      return {};
    },
  },

  {
    method: 'POST',
    path: '/users/password/reset',
    options: {
      description: 'Reset password for a single user',
      auth: false,
      validate: {
        payload: {
          token: Joi.string().length(64),
          password: passwordSchema,
          confirmPassword: Joi.any().only(Joi.ref('password')),
        },
      },
      response: { schema: response },
    },
    handler: async (request: ResetPasswordRequest, h: Hapi.ResponseToolkit) => {
      const {
        server: { app: { knex } },
        payload: { token, password },
      } = request;
      let user: User;

      try {
        user = await Users.fromPasswordResetToken(knex, token);
      } catch (error) {
        request.log('warning', error);
        return Boom.badRequest('Invalid token');
      }

      const hashedPw = await hash(password, 10);

      await Users.update(knex, user, { password: hashedPw });

      return null;
    },
  },
];

export default routes;
