import { defineConfig } from 'jsrepo';

export default defineConfig({
    // configure where stuff comes from here
    registries: ["https://reactbits.dev/default"],
    // configure where stuff goes here
    paths: {"*":"components/reactbits/*"},
});