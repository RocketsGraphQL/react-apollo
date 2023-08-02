import React, { Component } from "react";

type MyProps = {
    // using `interface` is also ok
    children: any,
    auth: any,
    gqlEndpoint: string
};

export class RApolloProvider extends Component {
    constructor(props: MyProps) {
        super(props);
        console.log("Super", props);
    }
    render() {
        return <div> Hello world </div>;
    }
}