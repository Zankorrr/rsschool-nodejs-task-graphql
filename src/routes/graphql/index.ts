import { UserType, ProfileType, PostType, MemberTypeType } from './types';
import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { GraphQLSchema, GraphQLObjectType, graphql, GraphQLList } from 'graphql';
import { graphqlBodySchema } from './schema';

const plugin: FastifyPluginAsyncJsonSchemaToTs = async (
  fastify
): Promise<void> => {
  fastify.post(
    '/',
    {
      schema: {
        body: graphqlBodySchema,
      },
    },
    async function (request, reply) {
      const schema = new GraphQLSchema({
        query: new GraphQLObjectType({
          name: 'query',
          fields: {
            users: {
              type: new GraphQLList(UserType),
              resolve () {
                return fastify.db.users.findMany()
              }
            },
            profiles: {
              type: new GraphQLList(ProfileType),
              resolve () {
                return fastify.db.profiles.findMany()
              }
            },
            posts: {
              type: new GraphQLList(PostType),
              resolve () {
                return fastify.db.posts.findMany()
              }
            },
            memberTypes: {
              type: new GraphQLList(MemberTypeType),
              resolve () {
                return fastify.db.memberTypes.findMany()
              }
            }

            // user: {
            //     type: UserType,
            //     args: {
            //       id: {
            //               type: new GraphQLNonNull(GraphQLID)
            //             },
            //     },
            //     resolve (_, args: { id: string }) {
            //       return fastify.db.users.findOne({key: "id", equals: args.id})
            //     }
            //   },
          }
        })
      })
      return await graphql({
        schema,
        source: String(request.body.query),
        contextValue: fastify,
        variableValues: request.body.variables,
      });
    }
  );
};

export default plugin;


// {"firstName":"aaa", "lastName":"aaa", "email":"aaa"}
// {"avatar":"aa", "sex":"aa", "birthday":"11", "country":"aa", "city":"aa", "street":"aa", "memberTypeId":"basic", "userId":""}
// {"title": "a", "content": "a", "userId": ""}
// {"query": "query {users {id, firstName, lastName, email}, profiles {avatar, sex, birthday, country, city, street, memberTypeId, userId, id}, posts {id, title, content, userId}, memberTypes {id, discount, monthPostsLimit}}"}
// {"query":"query user ($userId:ID!){user (id: $userId) {id, firstName, lastName, email}}", "variables":{"userId":"cabb1942-f0f9-4ff7-b420-201946b5cfd3"}}