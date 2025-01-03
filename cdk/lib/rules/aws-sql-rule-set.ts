import { aws_wafv2 } from "aws-cdk-lib";

export const awsSqlRuleSet: aws_wafv2.CfnWebACL.RuleProperty = {
  name: "AWS-AWSManagedRulesSQLiRuleSet",
  priority: 1,
  statement: {
    managedRuleGroupStatement: {
      vendorName: "AWS",
      name: "AWSManagedRulesSQLiRuleSet",
      excludedRules: [],
    },
  },
  overrideAction: {
    none: {},
  },
  visibilityConfig: {
    sampledRequestsEnabled: true,
    cloudWatchMetricsEnabled: true,
    metricName: "AWS-AWSManagedRulesSQLiRuleSet",
  },
};
