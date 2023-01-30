import { NoRequiredEntity } from './../../utils/DB/errors/NoRequireEntity.error';
import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { idParamSchema } from '../../utils/reusedSchemas';
import { createPostBodySchema, changePostBodySchema } from './schema';
import type { PostEntity } from '../../utils/DB/entities/DBPosts';

const plugin: FastifyPluginAsyncJsonSchemaToTs = async (
  fastify
): Promise<void> => {
  fastify.get('/', async function (request, reply): Promise<PostEntity[] | NoRequiredEntity> {
    const response = await fastify.db.posts.findMany()
    if(response.length) {
      return response
    } else {
      reply.notFound()
      return new NoRequiredEntity("getPosts")
    }
  });

  fastify.get(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<PostEntity | NoRequiredEntity> {
      const response = await fastify.db.posts.findOne({key: "id", equals: request.params.id})
      if(response) {
        return response
      } else {
        reply.notFound()
        return new NoRequiredEntity("getPost")
      }
    }
  );

  fastify.post(
    '/',
    {
      schema: {
        body: createPostBodySchema,
      },
    },
    async function (request, reply): Promise<PostEntity | NoRequiredEntity> {
      const user = await fastify.db.users.findOne({key: "id", equals: request.body.userId})
      if(user) {
        return await fastify.db.posts.create(request.body)
      } else {
        reply.badRequest()
        return new NoRequiredEntity("createPost")
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
    async function (request, reply): Promise<PostEntity | NoRequiredEntity> {
      const post = await fastify.db.posts.findOne({key: "id", equals: request.params.id})
      if(post) {
        return await fastify.db.posts.delete(post.id)
      } else {
        reply.badRequest()
        return new NoRequiredEntity("createPost")
      }
    }
  );

  fastify.patch(
    '/:id',
    {
      schema: {
        body: changePostBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<PostEntity | NoRequiredEntity> {
      const post = await fastify.db.posts.findOne({key: "id", equals: request.params.id})
      if(post) {
        return await fastify.db.posts.change(post.id, request.body)
      } else {
        reply.badRequest()
        return new NoRequiredEntity("createPost")
      }
    }
  );
};

export default plugin;
