import { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
    schema: "./schema.graphql", // change to endpoint url after release
    documents: "./src/graphql/*.graphql",
    ignoreNoDocuments: true, // for better experience with the watcher
    generates: {
        "./src/generated/": {
            preset: "client",
            plugins: [],
            config: {
                scalars: {
                    ID: {
                        input: "string | number",
                        output: "string",
                    },
                    Address: {
                        input: "string",
                        output: "string",
                    },
                    BigInt: {
                        input: "string",
                        output: "string",
                    },
                    TxID: {
                        input: "string",
                        output: "string",
                    },
                    Long: {
                        input: "number",
                        output: "number",
                    },
                    Guid: {
                        input: "string",
                        output: "string",
                    },
                },
            },
        },
    },
};

export default config;
