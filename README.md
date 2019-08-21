# Overview

This is the JS SDK for the BHP blockchain platform. This project aims to be a lightweight library focused on providing blockchain interactions in the browser.

# Getting started

## Usage

### Nodejs

```
const Bhp = require("./bhp-js");
const acct = new Bhp.wallet.Account("910183411298293648578c14f4d34bf8ba5ff03e28a026b3eb0a744f589b05d3");
```

### Browser

Once imported using the script tag, the module is available as a global object `Bhp`.

```
<script src="./bhp-browser.js"></script>
<script>
    console.log(Bhp);
	const account = new Bhp.wallet.Account("910183411298293648578c14f4d34bf8ba5ff03e28a026b3eb0a744f589b05d3");
	console.log(account);
</script>
```

# Contributing

## Setup

This repository is a typescript mono-repo using Lerna and Yarn workspaces. Please ensure the following is installed:

- Yarn (a version that support workspaces)
- Node (latest LTS aka v8 at time of writing)

> `lerna` is optional and only required for advanced operations.

```
git clone https://github.com/BhpAlpha/bhp-js.git
cd bhp-js
yarn
```