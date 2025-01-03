import {
  Stack,
  StackProps,
  aws_certificatemanager,
  aws_ec2,
  aws_ecs,
  aws_ecs_patterns,
  aws_route53,
  aws_wafv2,
} from "aws-cdk-lib";
import { ApplicationProtocol } from "aws-cdk-lib/aws-elasticloadbalancingv2";
import { Construct } from "constructs";

export interface AppStackProps extends StackProps {
  vpc: aws_ec2.IVpc;
  domainName: string;
  certificate: aws_certificatemanager.ICertificate;
  webAclId: string;
  hostedZoneId: string;
  zoneName: string;
  securityGroup: aws_ec2.SecurityGroup;
}

export class AppStack extends Stack {
  constructor(scope: Construct, id: string, props: AppStackProps) {
    super(scope, id, props);

    const securityGroup = new aws_ec2.SecurityGroup(this, "JuiceShopSG", {
      vpc: props.vpc,
      description: "Security group for Juice Shop ALB",
      allowAllOutbound: true,
    });

    securityGroup.addIngressRule(
      aws_ec2.Peer.ipv4("YOUR_IP_RANGE"),
      aws_ec2.Port.tcp(443),
      "Allow HTTPS from specific IP range"
    );

    const juiceShopService =
      new aws_ecs_patterns.ApplicationLoadBalancedFargateService(
        this,
        "juice-shop",
        {
          securityGroups: [securityGroup],
          vpc: props.vpc,
          cpu: 512,
          memoryLimitMiB: 1024,
          taskImageOptions: {
            image: aws_ecs.ContainerImage.fromRegistry("bkimminich/juice-shop"),
            containerPort: 3000,
            environment: {
              NODE_ENV: "production",
            },
          },
          protocol: ApplicationProtocol.HTTPS,
          certificate: props.certificate,
          publicLoadBalancer: true,
          domainName: props.domainName,
          domainZone: aws_route53.HostedZone.fromHostedZoneAttributes(
            this,
            "HostedZone",
            {
              hostedZoneId: props.hostedZoneId,
              zoneName: props.zoneName,
            }
          ),
        }
      );

    const cfnWebACLAssociation = new aws_wafv2.CfnWebACLAssociation(
      this,
      "WebACLAssociation",
      {
        resourceArn: juiceShopService.loadBalancer.loadBalancerArn,
        webAclArn: props.webAclId,
      }
    );

    juiceShopService.targetGroup.configureHealthCheck({
      path: "/rest/admin/application-version",
    });
  }
}
