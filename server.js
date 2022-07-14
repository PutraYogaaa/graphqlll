const express = require('express')
const expressGraphQL = require('express-graphql').graphqlHTTP
const {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLList,
  GraphQLInt,
  GraphQLNonNull
} = require('graphql')
const app = express()

const authors = [
	{ id: 1, name: 'TVN' },
	{ id: 2, name: 'SBS' },
	{ id: 3, name: 'KBS' },
  { id: 4, name: 'JTBC' }
]

const drakors = [
	{ id: 1, name: 'Vincenzo', authorId: 1 },
	{ id: 2, name: 'Hospital Playlist 2', authorId: 1 },
	{ id: 3, name: 'Secret Garden', authorId: 2 },
	{ id: 4, name: 'Vagabond', authorId: 2 },
  { id: 5, name: 'Racket Boys', authorId: 2 },
	{ id: 6, name: 'My Only One', authorId: 3 },
	{ id: 7, name: 'My Golden Life', authorId: 3 },
	{ id: 8, name: 'The Beauty Inside', authorId: 4 },
	{ id: 9, name: 'The World of the Married ', authorId: 4 },
  { id: 10, name: 'Goblin', authorId: 1 },
]

const drakorType = new GraphQLObjectType({
  name: 'drakor',
  description: 'This represents a drakor written by an author',
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLInt) },
    name: { type: GraphQLNonNull(GraphQLString) },
    authorId: { type: GraphQLNonNull(GraphQLInt) },
    author: {
      type: AuthorType,
      resolve: (drakor) => {
        return authors.find(author => author.id === drakor.authorId)
      }
    }
  })
})

const AuthorType = new GraphQLObjectType({
  name: 'Author',
  description: 'This represents a author of a drakor',
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLInt) },
    name: { type: GraphQLNonNull(GraphQLString) },
    drakors: {
      type: new GraphQLList(drakorType),
      resolve: (author) => {
        return drakors.filter(drakor => drakor.authorId === author.id)
      }
    }
  })
})

const RootQueryType = new GraphQLObjectType({
  name: 'Query',
  description: 'Root Query',
  fields: () => ({
    drakor: {
      type: drakorType,
      description: 'A Single drakor',
      args: {
        id: { type: GraphQLInt }
      },
      resolve: (parent, args) => drakors.find(drakor => drakor.id === args.id)
    },
    drakors: {
      type: new GraphQLList(drakorType),
      description: 'List of All drakors',
      resolve: () => drakors
    },
    authors: {
      type: new GraphQLList(AuthorType),
      description: 'List of All Authors',
      resolve: () => authors
    },
    author: {
      type: AuthorType,
      description: 'A Single Author',
      args: {
        id: { type: GraphQLInt }
      },
      resolve: (parent, args) => authors.find(author => author.id === args.id)
    }
  })
})

const RootMutationType = new GraphQLObjectType({
  name: 'Mutation',
  description: 'Root Mutation',
  fields: () => ({
    adddrakor: {
      type: drakorType,
      description: 'Add a drakor',
      args: {
        name: { type: GraphQLNonNull(GraphQLString) },
        authorId: { type: GraphQLNonNull(GraphQLInt) }
      },
      resolve: (parent, args) => {
        const drakor = { id: drakors.length + 1, name: args.name, authorId: args.authorId }
        drakors.push(drakor)
        return drakor
      }
    },
    addAuthor: {
      type: AuthorType,
      description: 'Add an author',
      args: {
        name: { type: GraphQLNonNull(GraphQLString) }
      },
      resolve: (parent, args) => {
        const author = { id: authors.length + 1, name: args.name }
        authors.push(author)
        return author
      }
    }
  })
})

const schema = new GraphQLSchema({
  query: RootQueryType,
  mutation: RootMutationType
})

app.use('/graphql', expressGraphQL({
  schema: schema,
  graphiql: true
}))
app.listen(5000, () => console.log('Server Running'))