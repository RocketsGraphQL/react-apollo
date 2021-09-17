import React from "react";
import {
  ApolloProvider,
  ApolloClient,
  ApolloLink,
  createHttpLink,
  split,
  InMemoryCache,
  from,
} from "@apollo/client";

const defaultOptions = {
  watchQuery: {
    fetchPolicy: "cache-and-network",
  }
}

export function generateApolloClient({
    auth,
    gqlEndpoint,
    headers,
    publicRole = "public",
    cache,
    connectToDevTools = false,
    onError
  }) {
    const getheaders = (auth) => {
        // add headers
        const resHeaders = {
          ...headers,
        };
    
        // add auth headers if signed in
        // or add 'public' role if not signed in
        if (auth) {
          if (auth.isAuthenticated()) {
            resHeaders.authorization = `Bearer ${auth.getJWTToken()}`;
          } else {
            resHeaders.role = publicRole;
          }
        }
    
        return resHeaders;
    };

    const authHeaders = getheaders(auth);
    const authLink = new ApolloLink((operation, forward) => {
        operation.setContext(({ headers }) => ({ headers: {
          ...authHeaders,
          ...headers,
        }}));
        return forward(operation);
    });
    const client = new ApolloClient({
        uri: gqlEndpoint,
        link: authLink,
        cache: new InMemoryCache(),
    });
    return client;
}

export class RApolloProvider extends React.Component {
    constructor(props) {
        super(props);
        const {
            auth,
            gqlEndpoint,
            headers,
            publicRole = "public",
            cache,
            connectToDevTools,
            onError,
        } = this.props;
        const client = generateApolloClient({
            auth,
            gqlEndpoint,
            headers,
            publicRole,
            cache,
            connectToDevTools,
            onError,
        });
        this.client = client;
    }
    render() {
        return (
          <ApolloProvider client={this.client}>
            {this.props.children}
          </ApolloProvider>
        );
    }
}