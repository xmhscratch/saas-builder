#!/bin/bash

locations=(
    "localdomain.local"
)
ipAddresses=()

for location in ${locations[@]}
do
    ipAddress="$(getent hosts $location | awk '{ print $1 }')";
    ipAddresses+=(ipAddress);

    echo "$ipAddress $(ping -qc1 $ipAddress 2>&1 | awk -F'/' 'END{ print (/^rtt/? "OK "$5"ms":"FAIL") }') $location";
done

# printf '%s\n' "${ipAddresses[@]}"
