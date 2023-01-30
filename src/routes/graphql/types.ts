import { GraphQLObjectType, GraphQLID, GraphQLString, GraphQLInt, GraphQLNonNull, GraphQLList } from 'graphql';

export const ProfileType = new GraphQLObjectType({
  name: "Profile",
  fields: {
    id: {type: GraphQLID},
    avatar: {type: GraphQLString},
    sex: {type: GraphQLString},
    birthday: {type: GraphQLInt},
    country: {type: GraphQLString},
    street: {type: GraphQLString},
    city: {type: GraphQLString},
    memberTypeId: {type: GraphQLString},
    userId: {type: new GraphQLNonNull(GraphQLID)},
  }
})

export const PostType = new GraphQLObjectType({
  name: "Post",
  fields: {
    id: {type: new GraphQLNonNull(GraphQLID)},
    title: {type: GraphQLString},
    content: {type: GraphQLString},
    userId: {type: new GraphQLNonNull(GraphQLID)},
  }
})

export const MemberTypeType = new GraphQLObjectType({
  name: "MemberType",
  fields: {
    id: {type: GraphQLString},
    discount: {type: GraphQLInt},
    monthPostsLimit: {type: GraphQLInt},
  }
})

export const UserType = new GraphQLObjectType({
  name: "User",
  fields:  {
    id: {type: GraphQLID},
    firstName: {type: new GraphQLNonNull(GraphQLString)},
    lastName: {type: new GraphQLNonNull(GraphQLString)},
    email: {type: new GraphQLNonNull(GraphQLString)},
    subscribedToUserIds: {type: new GraphQLList(GraphQLID)},
    // profile: {type: ProfileType},
    // posts: {type: PostType},
    // memberType: {type: MemberTypeType}
  }
})