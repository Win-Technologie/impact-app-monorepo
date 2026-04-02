const fs = require('fs');
const filePath = 'app/declarations/twoPersonnes/InfoPersons/myInfo/assuranceInfo.jsx';
let c = fs.readFileSync(filePath, 'utf8');

const CRLF = '\r\n';

const newStyles =
  '  noInsuranceBox: {' + CRLF +
  "    backgroundColor: '#fff3cd'," + CRLF +
  '    padding: 20,' + CRLF +
  '    borderRadius: 8,' + CRLF +
  '    marginBottom: 20,' + CRLF +
  '    borderLeftWidth: 4,' + CRLF +
  "    borderLeftColor: '#ffc107'," + CRLF +
  '  },' + CRLF +
  '  noInsuranceText: {' + CRLF +
  '    fontSize: 16,' + CRLF +
  "    fontWeight: 'bold'," + CRLF +
  "    color: '#856404'," + CRLF +
  '    marginBottom: 8,' + CRLF +
  '  },' + CRLF +
  '  noInsuranceSubText: {' + CRLF +
  '    fontSize: 14,' + CRLF +
  "    color: '#856404'," + CRLF +
  '  },' + CRLF;

const oldEnd = '    right: 0,' + CRLF + '  },' + CRLF + '});';
const newEnd = '    right: 0,' + CRLF + '  },' + CRLF + CRLF + newStyles + '});';

if (!c.includes(oldEnd)) {
  console.error('ERROR: anchor not found');
  process.exit(1);
}

c = c.replace(oldEnd, newEnd);
fs.writeFileSync(filePath, c, 'utf8');
console.log('Styles added successfully.');
