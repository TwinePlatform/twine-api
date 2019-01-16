#!/usr/bin/env bash

#
# Use to download archived logs from papertrail between two dates
#
# Usage
#  $ ./bin/fetch_papertrail_logs.sh [from] [to] [output_file]
#
# Arguments
#  from - YYYY-MM-DD date string; lower date limit for log retrieval
#
#  to - YYYY-MM-DD date string; upper date limit for log retrieval
#
#  output_file - filepath in which to dump the contents of the logs
#
# Environment
#  PAPERTRAIL_API_TOKEN - [required] Personal API access token for Papertrail API
#
# NOTES:
# - Ensure the script has execute permissions, otherwise execute via `bash`.
# - All *.tsv.gz files in the root directory are removed afterwards. Backup any files you wish to keep

# Variables
DATE_FROM=$1
DATE_TO=$2
FNAME=$3
PWD=$(pwd)
PATTERN="${PWD}/"*.tsv.gz

# Initial checks
if [ -z "${PAPERTRAIL_API_TOKEN}" ]; then
  echo "Set the environment variable 'PAPERTRAIL_API_TOKEN'"
  echo "The API token can be found in the profile page of your Papertrail account"
  exit 1
fi

if [ -z "${FNAME}" ]; then
  echo "Output filename not supplied"
  exit 1
fi

# User notice
echo "Using ${PAPERTRAIL_API_TOKEN}"
echo "Fetching logs between ${DATE_FROM} and ${DATE_TO}"
echo "Dumping logs to ${FNAME} in $(pwd)"

# Fetch log manifest, parse for requested dates, generate new requests
curl -sH "X-Papertrail-Token: ${PAPERTRAIL_API_TOKEN}" https://papertrailapp.com/api/v1/archives.json |
  grep -o '"filename":"[^"]*"' | egrep -o '[0-9-]+' |
  awk '$0 >= "'${DATE_FROM}'" && $0 < "'${DATE_TO}'" {
    print "output " $0 ".tsv.gz"
    print "url https://papertrailapp.com/api/v1/archives/" $0 "/download"
  }' | curl --progress-bar -fLH "X-Papertrail-Token: ${PAPERTRAIL_API_TOKEN}" -K-

# Unzip and concatenate downloaded files into output file
for f in *.tsv.gz; do
  gunzip -c "${f}" > ${FNAME};
done

# Remove zipped files
rm *.tsv.gz
