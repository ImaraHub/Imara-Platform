Step 1 — Set Up S3 Bucket for Static Website Hosting
🔹 A. Bucket Naming

    Name your bucket exactly as your domain:
    ✅ www.imarahub.xyz 
    Region: You can use any region (e.g., us-east-1), but your SSL certificate must be requested in us-east-1 (more in step 2).

🔹 B. Enable Static Website Hosting

    This is required if you're going to use the S3 website endpoint (which we are, because CloudFront prefers it for static sites).

    Go to the S3 bucket you created (www.imarahub.xyz)

    Click Properties

    Scroll to Static website hosting

    Click Edit

    Select: ✅ “Enable”

    Choose: ✅ “Host a static website”

    Enter:

        Index document: index.html

        (Optional) Error document: error.html

    Click Save changes

After enabling, you’ll get a Website endpoint like:
```

```
🔹 C. Make Bucket Contents Public

CloudFront does not sign requests when using the S3 website endpoint, so you must allow public access:

    Go to Permissions > Block public access

    Click Edit

    Uncheck all block options and confirm ✅

Then add a bucket policy to allow public reads:

    Go to Permissions > Bucket policy

    Add this policy (replace with your bucket name):

{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadForWebsite",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::www.imarahub.xyz/*"
    }
  ]
}

    Save policy ✅

🔹 D. Upload Your Website Files

Make sure you’ve uploaded your index.html, CSS, JS, and other assets into the bucket (not inside a subfolder).


✅ Step 2 — Request an SSL Certificate in AWS (ACM)

This certificate will allow your website (www.imarahub.xyz) to be served over HTTPS using CloudFront.
🔹 A. Open AWS Certificate Manager (ACM)

    Go to ACM Console

    ⚠️ Important:
    Set region to us-east-1 (N. Virginia), because CloudFront only works with SSL certs in us-east-1

    Click “Request a certificate”

🔹 B. Request a Public Certificate

    Choose: ✅ “Request a public certificate”

    Add domain name(s):

        www.imarahub.xyz ← (main site)

        (optional) imarahub.xyz ← (naked/root domain, if you want to redirect it)

    Click Next

🔹 C. Choose Validation Method

Choose: ✅ DNS validation (recommended)
You’ll get a CNAME record to add to your domain’s DNS (on Truehost).
🔹 D. Add DNS Records to Truehost

AWS will now give you a CNAME like:
Name (Record)	Type	Value
_abc123.www.imarahub.xyz.	CNAME	_xyz.acm-validations.aws.

On Truehost (your domain provider):

    Go to your domain's DNS panel

    Add a new CNAME record

    Paste the record from ACM

    Save and wait a few minutes

AWS will auto-detect the record and show the certificate as “Issued” (might take 5–15 min).

🔹 Add this record:
Field	Value
Name	_f69cc3ae20f757d95f13b75f5d01ac5f.www.imarahub.xyz. (or just the subdomain part depending on Truehost's UI — see below)
Type	CNAME
Value	_966608b2c75a5c5f6223e858572af357.xlfgrmvvlj.acm-validations.aws.
TTL

+ after it shows as verified or issued

✅ Step 3: Create a CloudFront Distribution
🔹 1. Go to CloudFront Console

    Visit: https://console.aws.amazon.com/cloudfront

🔹 2. Click “Create distribution”
🔹 3. Origin Settings
Field	Value
Origin domain	Select your S3 bucket (pick the one ending in .s3-website-...) — this is the S3 website endpoint, not the REST API one
Origin path	(leave empty)
Name	(auto-filled)
Origin access control	None (bucket is public)
Origin protocol policy	HTTP only (since S3 website endpoint doesn't support HTTPS)
🔹 4. Default Cache Behavior Settings
Field	Value
Viewer protocol policy	Redirect HTTP to HTTPS ✅
Allowed HTTP methods	GET, HEAD
Cache policy	CachingOptimized (default)
🔹 5. Custom SSL (HTTPS)

Under “Settings” section:
Field	Value
Price class	Use “Use only US, Canada and Europe” (or “Use all edge locations” for global)
Alternate domain name (CNAME)	www.imarahub.xyz
Custom SSL certificate	Choose your validated certificate from dropdown ✅
🔹 6. Default root object

Set this to:

index.html

This ensures the base path https://www.imarahub.xyz/ loads your homepage.
🔹 7. Click “Create distribution”

CloudFront will begin deploying — it may take 10–20 minutes.
✅ Step 4: Point your domain to CloudFront

Once CloudFront is deployed:

    Go to the distribution detail page.

    Copy the Distribution Domain Name — something like:

    d1234abcd1234.cloudfront.net

    Go to Truehost DNS management.

    Add a CNAME record like this:

Field	Value
Name	www
Type	CNAME
Value	d1234abcd1234.cloudfront.net
This points www.imarahub.xyz to CloudFront.





✅ Hosting a Backend API on AWS (the clean way)
🔧 What we’ll use:

    EC2: For running the backend (virtual server).

    Route 53: For custom domain (via Truehost if already used).

    ACM/HTTPS: Optional, for TLS.

    IAM & Security Groups: For secure access.

🔁 Quick Overview

    ✅ Prepare your backend (e.g., Go binary)

    ✅ Launch an EC2 instance (Ubuntu)

    ✅ SSH into the instance

    ✅ Upload and run your app

    ✅ Open the port (e.g., 8080)

    ✅ Point api.imarahub.xyz to your EC2 IP (via Truehost DNS)

    (Optional) Setup Nginx + HTTPS

🧱 Step-by-Step: AWS EC2 Hosting
✅ 1. Package your backend

If it’s in Go:

GOOS=linux GOARCH=amd64 go build -o app main.go

Now you have a Linux-compatible binary app.
✅ 2. Launch EC2 instance

    Go to AWS Console → EC2 → Launch Instance

    Choose:

        Ubuntu Server 22.04

        t2.micro (Free tier)

    Allow SSH (port 22) + your app port (e.g., 8080 or 80)

    Add a key pair (download .pem)

    Launch

✅ 3. SSH into the server

chmod 400 your-key.pem
ssh -i your-key.pem ubuntu@your-ec2-ip

✅ 4. Upload and run your app

From your local machine:

scp -i your-key.pem app ubuntu@your-ec2-ip:~

Then on the EC2 instance:

chmod +x app
./app

You should now see your server running!
✅ 5. Update Security Group

Ensure the Security Group allows Inbound Traffic on your backend port (e.g., 8080 or 80):

    Go to EC2 → Instances → Select instance → Security → Security Groups → Inbound Rules → Edit

    Add rule: Custom TCP / 8080 / 0.0.0.0/0