import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { idParamSchema } from '../../utils/reusedSchemas';
import {
  createUserBodySchema,
  changeUserBodySchema,
  subscribeBodySchema,
} from './schemas';
import type { UserEntity } from '../../utils/DB/entities/DBUsers';
import { NoRequiredEntity } from '../../utils/DB/errors/NoRequireEntity.error';

const plugin: FastifyPluginAsyncJsonSchemaToTs = async (
  fastify
): Promise<void> => {
  fastify.get('/', async function (request, reply): Promise<UserEntity[]> {
    const response = await fastify.db.users.findMany()
    response.length ? reply.status(200).send(response) : reply.notFound()
    return response
  });

  fastify.get(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<UserEntity | null> {
      const response = await fastify.db.users.findOne({key: "id", equals: request.params.id})
      response ? reply.status(200).send(response) : reply.status(404)
      return response
    }
  );

  fastify.post(
    '/',
    {
      schema: {
        body: createUserBodySchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {
      const { firstName, lastName, email } = request.body
      const response = await fastify.db.users.create({firstName, lastName, email})
      response ? reply.status(200).send(response) : reply.status(400).send()
      return response
    }
  );

  fastify.delete(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<UserEntity | NoRequiredEntity> {
      const user = await fastify.db.users.findOne({key: "id", equals: request.params.id})
      if(user) {
        const subscribers = await fastify.db.users.findMany({key: "subscribedToUserIds", inArray: user.id })
        if(subscribers.length) {
          subscribers.map(async el => {
            const subscriber = await fastify.db.users.findOne({key: "id", equals: request.params.id})
            if(subscriber) {
              const newSubscribes = subscriber.subscribedToUserIds.filter(item => item !== el.id)
              await fastify.db.users.change(el.id, {...el, subscribedToUserIds: newSubscribes})
            }
          })
        }
        reply.status(204).send()
        return await fastify.db.users.delete(request.params.id)
      } else {
        reply.badRequest()
        const err = new NoRequiredEntity("delete")
        return err
      }
    }
  );

  fastify.post(
    '/:id/subscribeTo',
    {
      schema: {
        body: subscribeBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<UserEntity | NoRequiredEntity> {
      const user = await fastify.db.users.findOne({key: "id", equals: request.params.id})
      const target = await fastify.db.users.findOne({key: "id", equals: request.body.userId})
      if(user && target) {
        const newSubscribes = [...target.subscribedToUserIds, request.params.id]
        const response = await fastify.db.users.change(target.id, {...target, subscribedToUserIds: newSubscribes})
        reply.status(200).send()
        return response
      } else {
        const err = new NoRequiredEntity("subscribeTo")
        return err
      }
    }
  );

  fastify.post(
    '/:id/unsubscribeFrom',
    {
      schema: {
        body: subscribeBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<UserEntity | NoRequiredEntity> {
      const user = await fastify.db.users.findOne({key: "id", equals: request.params.id})
      const target = await fastify.db.users.findOne({key: "id", equals: request.body.userId})
      if(user && target && target.subscribedToUserIds.includes(user.id)) {
        const newSubscribes = target.subscribedToUserIds.filter(item => item !== user.id)
        const response = await fastify.db.users.change(target.id, {...target, subscribedToUserIds: newSubscribes})
        return response
      }
      else {
        reply.badRequest()
        const err = new NoRequiredEntity("unsubscribeFrom")
        return err
      }
    }
  );

  fastify.patch(
    '/:id',
    {
      schema: {
        body: changeUserBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {
      const user = await fastify.db.users.findOne({key: "id", equals: request.params.id})
      user ? reply.status(200).send() : reply.status(400).send()
      const { firstName, lastName, email } = request.body
      const response = await fastify.db.users.change(request.params.id, { firstName, lastName, email})
      return response
    }
  );
};

export default plugin;
