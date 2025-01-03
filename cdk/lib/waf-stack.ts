import { Stack, StackProps } from "aws-cdk-lib";
import { CfnWebACL } from "aws-cdk-lib/aws-wafv2";
import { Construct } from "constructs";
import { awsCommonRuleSet } from "./rules/aws-common-rule-set";
import { awsSqlRuleSet } from "./rules/aws-sql-rule-set";

export class WafStack extends Stack {
  public readonly webAcl: CfnWebACL;

  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);
    this.webAcl = new CfnWebACL(this, "SecurityBoardWAF", {
      defaultAction: { allow: {} },
      name: "SecurityBoardWAF",
      scope: "REGIONAL",
      rules: [awsCommonRuleSet, awsSqlRuleSet],
      visibilityConfig: {
        cloudWatchMetricsEnabled: true,
        metricName: "SecurityBoardWAFMetrics",
        sampledRequestsEnabled: true,
      },
    });
  }
}
