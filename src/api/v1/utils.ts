/*
 * API specific utilities
 */
import * as Hapi from 'hapi';
import * as Boom from 'boom';
import { ApiResponse } from './schema/response';


/*
 * Boom error type does not include key details
 * added by Joi failAction validation method
 */
export interface BoomWithValidation extends Boom {
  details: { message: string }[];
}

/*
 * Catches Joi validation errors thrown from failAction and formats response
 *
 * Note joi is configured to fail on first validation error
 * so 'details' only has one element
 *
 *  We only choose to re-format the boom response
 * in order to get rid of the strange artefact of having
 * an `error.error` attribute.
 *
 * This function can be done in one line with `renameKeys`
 * but the compiler complains because it can't infer the
 * correct keys
 */

export const formatBoom = (error: BoomWithValidation): ApiResponse => {
  const { name, details, output: { payload } } = error;

  if (name === 'ValidationError') {
    const message = details[0].message;
    const [, messageTopic, messageError] = message.match(/^\"([^"]+)\" (.*)/);
    return {
      error: {
        statusCode: payload.statusCode,
        type: payload.error,
        message,
        validation: { [messageTopic]: messageError },
      },
    };
  } else {
    return {
      error: {
        statusCode: payload.statusCode,
        type: payload.error,
        message: payload.message,
      },
    };
  }
};

/*
 * If the response data is "raw", it is wrapped appropriately.
 * Otherwise if the response has meta-data attached to it (and
 * is therefore correctly formatted) it is simply passed through
 */
export const formatResponse = (res: Hapi.ResponseObject): ApiResponse => {
  const r: any = res.source;

  if (r === null) {
    return { result: null } as ApiResponse;
  }

  if (r.hasOwnProperty('result') && r.hasOwnProperty('meta')) {
    return { ...r } as ApiResponse;
  }

  return {
    result: r,
  };
};
