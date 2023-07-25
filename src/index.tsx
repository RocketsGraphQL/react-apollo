import React, { Component } from "react";
import {
    ApolloProvider,
    ApolloClient,
    ApolloLink,
    createHttpLink,
    split,
    InMemoryCache,
    from,
    HttpLink
} from "@apollo/client";
import { WebSocketLink } from "@apollo/client/link/ws";
import { getMainDefinition } from "@apollo/client/utilities";

type RApolloProviderProps = {
    // using `interface` is also ok
    children?: React.ReactNode,
    auth: any,
    gqlEndpoint: string,
    headers?: any,
    publicRole: string,
    cache?: any,
    connectToDevTools?: boolean,
    onError?: Function,
};

type RApolloProviderState = {
    client: any,
    wsLink: any,
}

export function generateApolloClient({
    auth,
    gqlEndpoint,
    headers,
    publicRole = "public",
    cache,
    connectToDevTools = false,
    onError
} : RApolloProviderProps ) : RApolloProviderState {
    const wsUri = gqlEndpoint.startsWith("https")
    ? gqlEndpoint.replace(/^https/, "wss")
    : gqlEndpoint.replace(/^http/, "ws");

    const getheaders = (auth: any) => {
        // add headers
        const resHeaders = {
          ...headers,
        };
    
        // add auth headers if signed in
        // or add 'public' role if not signed in
        if (auth) {
          if (auth.isAuthenticated()) {
            resHeaders["Authorization"] = `Bearer ${auth.getJWTToken()}`;
            resHeaders["X-Hasura-User-Id"] = `${auth.getUserId()}`;
            resHeaders["X-Hasura-Role"] = "user";
          } else {
            resHeaders["X-Hasura-Role"] = publicRole;
          }
        } else {
          resHeaders["X-Hasura-Role"] = publicRole;
        }

        //resHeaders["X-Hasura-Allowed-Roles"] = headers && headers["X-Hasura-Allowed-Roles"] ? headers["X-Hasura-Allowed-Roles"] : ["user", "public"]
        // resHeaders["X-Hasura-Default-Role"] = resHeaders["X-Hasura-Default-Role"] ? resHeaders["X-Hasura-Default-Role"] : "user"
        return resHeaders;
    };

    const authHeaders = getheaders(auth);
    const authLink = new ApolloLink((operation, forward) => {
        operation.setContext(({ headers } : { headers: any }) => ({ headers: {
          ...authHeaders,
        }}));
        return forward(operation);
    });

    const ssr = typeof window === "undefined";
  

    // create ws link
    const wsLink = !ssr
      ? new WebSocketLink({
          uri: wsUri,
          options: {
            reconnect: true,
            lazy: true,
            connectionParams: () => {
              const connectionHeaders = getheaders(auth);
              return {
                headers: connectionHeaders,
              };
            },
          },
        })
      : null;

    // Create an http link:
    const httpLink = new HttpLink({
      uri: gqlEndpoint
    });
    
    // using the ability to split links, you can send data to each link
    // depending on what kind of operation is being sent
    if (wsLink && typeof wsLink !== 'undefined') {
        const link = split(
            // split based on operation type
            ({ query }) => {
              const definition = getMainDefinition(query);
              return (
                definition.kind === 'OperationDefinition' &&
                definition.operation === 'subscription'
              );
            },
            wsLink,
            authLink.concat(httpLink),
        )
        const client = new ApolloClient({
            link: from([link]),
            cache: new InMemoryCache(),
        });
        return { client, wsLink };
    } else {
        throw new Error('gqlEndpoint not provided')
    }

}
export class RApolloProvider extends Component<RApolloProviderProps, RApolloProviderState> {
    client: any;
    wsLink: any;
    constructor(props: RApolloProviderProps) {
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
        const {client, wsLink} = generateApolloClient({
            auth,
            gqlEndpoint,
            headers,
            publicRole,
            cache,
            connectToDevTools,
            onError,
        });
        this.client = client;
        this.wsLink = wsLink;
    }
    render() {
        return (
            <ApolloProvider client={this.client}>
              {this.props.children}
            </ApolloProvider>
        );
    }
}