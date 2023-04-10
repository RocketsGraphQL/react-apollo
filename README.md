
# react apollo

React Apollo is a Provider to wrap your React Component with React Apollo Wrappers and Auth Providers. Basically you can use this wrapper to subscribe to items in Database based on authentication provided.

## Installation

`npm i --save @rocketgraphql/react-apollo`

## Usage

```
<RApolloProvider  auth={auth}  gqlEndpoint="http://localhost:8080/v1/graphql">
	<YourChildComponent  />
</RApolloProvider>
```

You can get your auth object from [Rockets js SDK](https://github.com/RocketsGraphQL/rocket-js-sdk)
You can read about the usage there.

You can use [Hasura](https://hasura.io/) to spin up your own GraphQL Console on top of PostgresDB
