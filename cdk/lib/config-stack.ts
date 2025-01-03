import {
  Stack,
  StackProps,
  aws_ec2,
  aws_route53,
  aws_certificatemanager,
} from "aws-cdk-lib";
import { Construct } from "constructs";

export interface ConfigStackProps extends StackProps {
  hostedZoneId: string;
  zoneName: string;
  subDomain: string;
  vpcCidr: string;
}

export class ConfigStack extends Stack {
  public readonly domainName: string;
  public readonly certificate: aws_certificatemanager.ICertificate;
  public readonly vpc: aws_ec2.IVpc;
  public readonly securityGroup: aws_ec2.SecurityGroup;

  constructor(scope: Construct, id: string, props: ConfigStackProps) {
    super(scope, id, props);

    this.domainName = `${props.subDomain}.${props.zoneName}`;

    this.certificate = new aws_certificatemanager.Certificate(
      this,
      "juice-shop-cert",
      {
        domainName: this.domainName,
        validation: aws_certificatemanager.CertificateValidation.fromDns(
          aws_route53.HostedZone.fromHostedZoneAttributes(this, "HostedZone", {
            hostedZoneId: props.hostedZoneId,
            zoneName: props.zoneName,
          })
        ),
      }
    );

    this.vpc = new aws_ec2.Vpc(this, "juice-shop-vpc", {
      maxAzs: 2,
      ipAddresses: aws_ec2.IpAddresses.cidr(props.vpcCidr),
    });

    this.securityGroup = new aws_ec2.SecurityGroup(this, "JuiceShopSG", {
      vpc: this.vpc,
      description: "Security group for Juice Shop ALB",
      allowAllOutbound: true,
    });

    this.securityGroup.addIngressRule(
      aws_ec2.Peer.ipv4("YOUR_IP_RANGE"),
      aws_ec2.Port.tcp(443),
      "Allow HTTPS from specific IP range"
    );
  }
}
