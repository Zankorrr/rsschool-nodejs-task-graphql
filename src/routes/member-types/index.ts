import { NoRequiredEntity } from './../../utils/DB/errors/NoRequireEntity.error';
import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { idParamSchema } from '../../utils/reusedSchemas';
import { changeMemberTypeBodySchema } from './schema';
import type { MemberTypeEntity } from '../../utils/DB/entities/DBMemberTypes';

const plugin: FastifyPluginAsyncJsonSchemaToTs = async (
  fastify
): Promise<void> => {
  fastify.get('/', async function (request, reply): Promise<
  MemberTypeEntity[]
  > {
    return await fastify.db.memberTypes.findMany()
  });

  fastify.get(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<MemberTypeEntity | NoRequiredEntity> {
      const type = await fastify.db.memberTypes.findOne({key: "id", equals: request.params.id})
      if(type) {
        return type
      } else {
        reply.notFound()
        return new NoRequiredEntity("getMemberType")
      }
    }
  );

  fastify.patch(
    '/:id',
    {
      schema: {
        body: changeMemberTypeBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<MemberTypeEntity | NoRequiredEntity> {
      const type = await fastify.db.memberTypes.findOne({key: "id", equals: request.params.id})
      if(type) {
        return await fastify.db.memberTypes.change(type.id, request.body)
      } else {
        reply.badRequest()
        return new NoRequiredEntity("getMemberType")
      }
    }
  );
};

export default plugin;
