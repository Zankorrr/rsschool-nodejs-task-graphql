import { NoRequiredEntity } from './../../utils/DB/errors/NoRequireEntity.error';
import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { idParamSchema } from '../../utils/reusedSchemas';
import { createProfileBodySchema, changeProfileBodySchema } from './schema';
import type { ProfileEntity } from '../../utils/DB/entities/DBProfiles';

const plugin: FastifyPluginAsyncJsonSchemaToTs = async (
  fastify
): Promise<void> => {
  fastify.get('/', async function (request, reply): Promise<
    ProfileEntity[]
  > {
    const response = await fastify.db.profiles.findMany()
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
    async function (request, reply): Promise<ProfileEntity | null> {
        const response = await fastify.db.profiles.findOne({key: "id", equals: request.params.id})
        response ? reply.status(200).send(response) : reply.notFound()
        return response
    }
  );

  fastify.post(
    '/',
    {
      schema: {
        body: createProfileBodySchema,
      },
    },
    async function (request, reply): Promise<ProfileEntity | NoRequiredEntity> {
      const existingProfile = await fastify.db.profiles.findOne({key: "userId", equals: request.body.userId})
      const type = await fastify.db.memberTypes.findOne({key: "id", equals: request.body.memberTypeId})
      if(existingProfile || !type) {
        reply.badRequest()
        return new NoRequiredEntity("createProfile")
      } else {
        return await fastify.db.profiles.create(request.body)
      }
    }
  );

  fastify.delete(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<ProfileEntity | NoRequiredEntity> {
      const profile = await fastify.db.profiles.findOne({key: "id", equals: request.params.id})
      if(profile) {
        reply.status(204).send()
        return await fastify.db.profiles.delete(request.params.id)
      } else {
        reply.badRequest()
        return new NoRequiredEntity("deleteProfile")
      }
    }
  );

  fastify.patch(
    '/:id',
    {
      schema: {
        body: changeProfileBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<ProfileEntity | NoRequiredEntity> {
      const profile = await fastify.db.profiles.findOne({key: "id", equals: request.params.id})
      if(profile) {
        const response = await fastify.db.profiles.change(profile.id, request.body)
        return response
      } else {
        reply.badRequest()
        return new NoRequiredEntity("changeProfile")
      }
    }
  );
};

export default plugin;
