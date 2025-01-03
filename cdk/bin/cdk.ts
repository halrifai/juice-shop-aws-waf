#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { ConfigStack } from "../lib/config-stack";
import { AppStack } from "../lib/app-stack";
import { WafStack } from "../lib/waf-stack";

const HOSTED_ZONE_ID = "YOUR_ZOME_ID";
const HOSTED_ZONE_DOMAIN = "YOUR_DOMAIN";
const SUBDOMAIN = "YOUR_SUBDOMAIN";
const VPC_CIDR = "10.0.0.0/16";
const REGION = "eu-central-1";

const app = new cdk.App();

const configStack = new ConfigStack(app, "JuiceShopConfigStack", {
  vpcCidr: VPC_CIDR,
  hostedZoneId: HOSTED_ZONE_ID,
  zoneName: HOSTED_ZONE_DOMAIN,
  subDomain: SUBDOMAIN,
  env: {
    region: REGION,
  },
});

const wafStack = new WafStack(app, "JuiceShopWafStack", {
  env: {
    region: REGION,
  },
});

new AppStack(app, "JuiceShopStack", {
  env: {
    region: REGION,
  },
  vpc: configStack.vpc,
  domainName: configStack.domainName,
  certificate: configStack.certificate,
  webAclId: wafStack.webAcl.attrArn,
  hostedZoneId: HOSTED_ZONE_ID,
  zoneName: HOSTED_ZONE_DOMAIN,
  securityGroup: configStack.securityGroup,
});
