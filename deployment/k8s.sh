kubectl create namespace localdomain
# kubectl create secret docker-registry registry-credentials --namespace=localdomain --docker-server=localhost --docker-username=root --docker-password=123456 --docker-email=no-reply@localdomain.local
# kubectl create --namespace=localdomain -f /home/web/repos/deployment/nfs.yaml
kubectl create serviceaccount sysadmin --namespace=kube-system
kubectl apply -f ./rbac.yaml

# https://localdomain:6443/api/v1/namespaces/kube-system/services/https:kubernetes-dashboard:/proxy/#!/login
# kubectl get secret -n kube-system | grep sysadmin | cut -d " " -f1 | xargs -n 1 | xargs kubectl get secret  -o 'jsonpath={.data.token}' -n kube-system | base64 --decode

kubectl create secret tls --namespace=localdomain localdomain-ssl --key /root/localdomain/domain.key --cert /root/localdomain/domain.pem
kubectl create secret tls --namespace=ingress-nginx localdomain-ssl --key /root/localdomain/domain.key --cert /root/localdomain/domain.pem

kubectl create secret generic tls-dhparam --namespace=ingress-nginx --from-file=/root/dhparam.pem

# restart a deployment
kubectl rollout restart --namespace=localdomain deployment/account
kubectl rollout restart --namespace=localdomain deployment/api
kubectl rollout restart --namespace=localdomain deployment/asset
kubectl rollout restart --namespace=localdomain deployment/asset-vendor
kubectl rollout restart --namespace=localdomain deployment/content
kubectl rollout restart --namespace=localdomain deployment/oauth
kubectl rollout restart --namespace=localdomain deployment/webhook
# kubectl rollout restart --namespace=localdomain deployment/customer

# init dashboard
kubectl create serviceaccount cluster-admin-dashboard-sa
kubectl create clusterrolebinding cluster-admin-dashboard-sa \
  --clusterrole=cluster-admin \
  --serviceaccount=default:cluster-admin-dashboard-sa

kubectl get secret | grep cluster-admin-dashboard-sa
kubectl describe secret cluster-admin-dashboard-sa-token-6xm8l

kubectl proxy --kubeconfig=./kubeconfig

kubectl get deploy --namespace=localdomain localdomain --no-headers=true |awk '{ print $1 }'| xargs -I % kubectl scale deployment/% --namespace=localdomain --replicas=0

# clean
kubectl delete --all daemonsets,replicasets,services,deployments,statefulsets,pods --namespace=localdomain --grace-period=0 --force
kubectl delete --all pods --namespace=localdomain --grace-period=0 --force
# docker container prune
# docker volume prune
