# Security Patterns

Secrets management, RBAC, policy validation, and security contexts.

---

## Secrets Management Approaches

| Approach | GitOps Safe | Complexity | Best For |
|----------|-------------|------------|----------|
| **External Secrets Operator** | Yes | Medium | Cloud-native, production |
| **Sealed Secrets** | Yes | Low | Simple GitOps |
| **SOPS + helm-secrets** | Yes | Medium | Developer-friendly |
| **Native K8s Secrets** | No* | Low | Development only |

*Unless encrypted in Git

---

## External Secrets Operator (ESO)

### ExternalSecret Template

```yaml
# values.yaml
externalSecrets:
  enabled: true
  secretStore:
    kind: ClusterSecretStore
    name: aws-secrets-manager
  data:
    - key: myapp/database
      property: password
      name: DB_PASSWORD
    - key: myapp/api
      property: key
      name: API_KEY
```

```yaml
# templates/external-secret.yaml
{{- if .Values.externalSecrets.enabled }}
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata:
  name: {{ include "myapp.fullname" . }}
  labels:
    {{- include "myapp.labels" . | nindent 4 }}
spec:
  refreshInterval: 1h
  secretStoreRef:
    kind: {{ .Values.externalSecrets.secretStore.kind }}
    name: {{ .Values.externalSecrets.secretStore.name }}
  target:
    name: {{ include "myapp.fullname" . }}-secrets
    creationPolicy: Owner
  data:
    {{- range .Values.externalSecrets.data }}
    - secretKey: {{ .name }}
      remoteRef:
        key: {{ .key }}
        property: {{ .property }}
    {{- end }}
{{- end }}
```

### Usage in Deployment

```yaml
# deployment.yaml
envFrom:
  - secretRef:
      name: {{ include "myapp.fullname" . }}-secrets
```

---

## Sealed Secrets

### Creating Sealed Secrets

```bash
# Seal a secret
kubectl create secret generic myapp-secrets \
  --from-literal=DB_PASSWORD=secret123 \
  --dry-run=client -o yaml | \
  kubeseal --format yaml > templates/sealed-secret.yaml
```

### Sealed Secret Template

```yaml
# templates/sealed-secret.yaml
apiVersion: bitnami.com/v1alpha1
kind: SealedSecret
metadata:
  name: {{ include "myapp.fullname" . }}-secrets
  namespace: {{ .Release.Namespace }}
  labels:
    {{- include "myapp.labels" . | nindent 4 }}
spec:
  encryptedData:
    # Encrypted at seal time - safe for Git
    DB_PASSWORD: AgBy3i...encrypted...
    API_KEY: AgBy8k...encrypted...
  template:
    metadata:
      name: {{ include "myapp.fullname" . }}-secrets
      labels:
        {{- include "myapp.labels" . | nindent 8 }}
```

---

## SOPS + helm-secrets

### .sops.yaml Configuration

```yaml
creation_rules:
  - path_regex: values/.*\.secrets\.yaml$
    kms: arn:aws:kms:us-east-1:123456789:key/abc-123
    # Or GCP KMS, Azure Key Vault, PGP, age
```

### Encrypted Values

```yaml
# values/prod.secrets.yaml (encrypted)
database:
  password: ENC[AES256_GCM,data:...encrypted...]
api:
  key: ENC[AES256_GCM,data:...encrypted...]
sops:
  kms:
    - arn: arn:aws:kms:...
```

### Deploy with helm-secrets

```bash
# Install plugin
helm plugin install https://github.com/jkroepke/helm-secrets

# Deploy with encrypted values
helm secrets upgrade --install myapp ./myapp \
  -f values/prod.yaml \
  -f values/prod.secrets.yaml
```

---

## Native Secrets (existingSecret Pattern)

### Values Pattern

```yaml
# values.yaml
database:
  # Either provide values directly (dev only)
  password: ""
  # OR reference existing secret
  existingSecret:
    name: ""
    key: "password"
```

### Template Pattern

```yaml
# deployment.yaml
env:
  - name: DB_PASSWORD
    {{- if .Values.database.existingSecret.name }}
    valueFrom:
      secretKeyRef:
        name: {{ .Values.database.existingSecret.name }}
        key: {{ .Values.database.existingSecret.key }}
    {{- else }}
    valueFrom:
      secretKeyRef:
        name: {{ include "myapp.fullname" . }}-secrets
        key: db-password
    {{- end }}
```

```yaml
# secret.yaml (only if not using existingSecret)
{{- if not .Values.database.existingSecret.name }}
apiVersion: v1
kind: Secret
metadata:
  name: {{ include "myapp.fullname" . }}-secrets
type: Opaque
data:
  db-password: {{ .Values.database.password | b64enc }}
{{- end }}
```

---

## Security Context

### Pod Security Context

```yaml
# values.yaml
podSecurityContext:
  runAsNonRoot: true
  runAsUser: 1000
  runAsGroup: 1000
  fsGroup: 1000
  seccompProfile:
    type: RuntimeDefault
```

### Container Security Context

```yaml
# values.yaml
securityContext:
  allowPrivilegeEscalation: false
  readOnlyRootFilesystem: true
  capabilities:
    drop:
      - ALL
```

### Helper Template

```yaml
# _helpers.tpl
{{- define "myapp.podSecurityContext" -}}
runAsNonRoot: {{ .Values.podSecurityContext.runAsNonRoot | default true }}
runAsUser: {{ .Values.podSecurityContext.runAsUser | default 1000 }}
runAsGroup: {{ .Values.podSecurityContext.runAsGroup | default 1000 }}
fsGroup: {{ .Values.podSecurityContext.fsGroup | default 1000 }}
seccompProfile:
  type: {{ .Values.podSecurityContext.seccompProfile.type | default "RuntimeDefault" }}
{{- end }}

{{- define "myapp.containerSecurityContext" -}}
allowPrivilegeEscalation: {{ .Values.securityContext.allowPrivilegeEscalation | default false }}
readOnlyRootFilesystem: {{ .Values.securityContext.readOnlyRootFilesystem | default true }}
capabilities:
  drop:
    {{- .Values.securityContext.capabilities.drop | default (list "ALL") | toYaml | nindent 4 }}
{{- end }}
```

---

## RBAC

### ServiceAccount Template

```yaml
# values.yaml
serviceAccount:
  create: true
  name: ""
  annotations: {}
    # eks.amazonaws.com/role-arn: arn:aws:iam::123456789:role/myapp
```

```yaml
# templates/serviceaccount.yaml
{{- if .Values.serviceAccount.create }}
apiVersion: v1
kind: ServiceAccount
metadata:
  name: {{ include "myapp.serviceAccountName" . }}
  labels:
    {{- include "myapp.labels" . | nindent 4 }}
  {{- with .Values.serviceAccount.annotations }}
  annotations:
    {{- toYaml . | nindent 4 }}
  {{- end }}
{{- end }}
```

### Role and RoleBinding

```yaml
# values.yaml
rbac:
  create: true
  rules:
    - apiGroups: [""]
      resources: ["configmaps", "secrets"]
      verbs: ["get", "list", "watch"]
    - apiGroups: [""]
      resources: ["pods"]
      verbs: ["get", "list"]
```

```yaml
# templates/role.yaml
{{- if .Values.rbac.create }}
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: {{ include "myapp.fullname" . }}
  labels:
    {{- include "myapp.labels" . | nindent 4 }}
rules:
  {{- toYaml .Values.rbac.rules | nindent 2 }}
---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: {{ include "myapp.fullname" . }}
  labels:
    {{- include "myapp.labels" . | nindent 4 }}
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: Role
  name: {{ include "myapp.fullname" . }}
subjects:
  - kind: ServiceAccount
    name: {{ include "myapp.serviceAccountName" . }}
    namespace: {{ .Release.Namespace }}
{{- end }}
```

---

## Policy Validation

### OPA/Gatekeeper Constraints

```yaml
# Helm chart can include constraint templates
# templates/constraints/require-labels.yaml
apiVersion: constraints.gatekeeper.sh/v1beta1
kind: K8sRequiredLabels
metadata:
  name: require-team-label
spec:
  match:
    kinds:
      - apiGroups: [""]
        kinds: ["Namespace"]
  parameters:
    labels: ["team"]
```

### Pre-Deploy Validation (Conftest)

```bash
# Policy file: policy/deployment.rego
package main

deny[msg] {
  input.kind == "Deployment"
  not input.spec.template.spec.securityContext.runAsNonRoot
  msg := "Containers must not run as root"
}

deny[msg] {
  input.kind == "Deployment"
  container := input.spec.template.spec.containers[_]
  not container.resources.limits
  msg := sprintf("Container '%s' must have resource limits", [container.name])
}
```

```bash
# Validate before deploy
helm template myapp ./myapp | conftest test -
```

### Kyverno Policies

```yaml
# templates/policies/require-probes.yaml
{{- if .Values.policies.enabled }}
apiVersion: kyverno.io/v1
kind: ClusterPolicy
metadata:
  name: require-probes
spec:
  validationFailureAction: enforce
  rules:
    - name: require-probes
      match:
        resources:
          kinds:
            - Deployment
      validate:
        message: "Liveness and readiness probes are required"
        pattern:
          spec:
            template:
              spec:
                containers:
                  - livenessProbe:
                      httpGet:
                        path: "*"
                    readinessProbe:
                      httpGet:
                        path: "*"
{{- end }}
```

---

## Security Scanning

### Trivy Integration

```bash
# Scan chart for misconfigurations
trivy config ./myapp

# Scan rendered manifests
helm template myapp ./myapp | trivy config -

# In CI/CD
trivy config ./myapp --exit-code 1 --severity HIGH,CRITICAL
```

### Snyk Integration

```bash
# Scan Helm chart
snyk iac test ./myapp

# Scan with values
helm template myapp ./myapp | snyk iac test -
```

---

## Network Policies

### Default Deny + Allow Pattern

```yaml
# values.yaml
networkPolicy:
  enabled: true
  ingress:
    - from:
        - namespaceSelector:
            matchLabels:
              name: ingress-nginx
      ports:
        - port: 8080
  egress:
    - to:
        - namespaceSelector: {}
      ports:
        - port: 443
        - port: 5432  # PostgreSQL
```

```yaml
# templates/networkpolicy.yaml
{{- if .Values.networkPolicy.enabled }}
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: {{ include "myapp.fullname" . }}
  labels:
    {{- include "myapp.labels" . | nindent 4 }}
spec:
  podSelector:
    matchLabels:
      {{- include "myapp.selectorLabels" . | nindent 6 }}
  policyTypes:
    - Ingress
    - Egress
  ingress:
    {{- toYaml .Values.networkPolicy.ingress | nindent 4 }}
  egress:
    {{- toYaml .Values.networkPolicy.egress | nindent 4 }}
{{- end }}
```

---

## Security Checklist

### Chart Security

- [ ] No secrets in values.yaml
- [ ] Use `existingSecret` pattern
- [ ] Security context with non-root
- [ ] Read-only root filesystem
- [ ] Drop all capabilities
- [ ] Resource limits defined
- [ ] Network policies included
- [ ] RBAC with least privilege

### Deployment Security

- [ ] Scan chart with trivy/snyk
- [ ] Validate with OPA/Kyverno
- [ ] Use digest pinning for images
- [ ] External secrets configured
- [ ] Service account with IRSA/Workload Identity
