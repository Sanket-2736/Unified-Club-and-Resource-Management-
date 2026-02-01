const dotenv = require('dotenv');
dotenv.config();

exports.isCampusEmail = (email) => {
  const allowedDomains = [
    proccess.env.CAMPUS_DOMAIN,
  ];

  return allowedDomains.some(domain =>
    email.toLowerCase().endsWith(`@${domain}`)
  );
};
