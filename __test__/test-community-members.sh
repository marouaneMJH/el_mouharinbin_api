#!/bin/bash

# Script de test pour l'endpoint GET /api/communities/:id/members
# Test de récupération des membres d'une communauté

echo "=== Test de récupération des membres d'une communauté ==="
echo

# Couleurs pour les messages
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
BASE_URL="http://localhost:3000"
COMMUNITY_MEMBERS_ENDPOINT="/api/communities"

# Vérifier si le script generate-test-token.js existe
if [ ! -f "generate-test-token.js" ]; then
    echo -e "${RED}❌ Erreur: generate-test-token.js non trouvé${NC}"
    echo "Ce fichier est nécessaire pour générer les tokens JWT de test"
    exit 1
fi

echo -e "${YELLOW}📊 Génération des tokens de test...${NC}"

# Générer des tokens pour différents utilisateurs
TOKEN_USER1=$(node generate-test-token.js user1@test.com user1-uuid)
TOKEN_USER2=$(node generate-test-token.js user2@test.com user2-uuid)
TOKEN_NON_MEMBER=$(node generate-test-token.js nonmember@test.com nonmember-uuid)

if [ -z "$TOKEN_USER1" ] || [ -z "$TOKEN_USER2" ] || [ -z "$TOKEN_NON_MEMBER" ]; then
    echo -e "${RED}❌ Erreur lors de la génération des tokens${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Tokens générés avec succès${NC}"
echo

# ID de communauté de test (vous devrez le remplacer par un ID réel)
COMMUNITY_ID="test-community-id"

echo -e "${YELLOW}🔍 Test 1: Récupération des membres avec un utilisateur membre${NC}"

RESPONSE1=$(curl -s -w "\nHTTP_STATUS:%{http_code}" \
  -H "Authorization: Bearer $TOKEN_USER1" \
  -H "Content-Type: application/json" \
  "$BASE_URL$COMMUNITY_MEMBERS_ENDPOINT/$COMMUNITY_ID/members?limit=10&offset=0")

HTTP_STATUS1=$(echo "$RESPONSE1" | grep "HTTP_STATUS:" | cut -d: -f2)
BODY1=$(echo "$RESPONSE1" | sed '/HTTP_STATUS:/d')

echo "Status: $HTTP_STATUS1"
echo "Response: $BODY1"

if [ "$HTTP_STATUS1" = "200" ]; then
    echo -e "${GREEN}✅ Test 1 réussi: Utilisateur membre peut voir la liste${NC}"
else
    echo -e "${RED}❌ Test 1 échoué: Status $HTTP_STATUS1${NC}"
fi
echo

echo -e "${YELLOW}🔍 Test 2: Récupération des membres avec pagination${NC}"

RESPONSE2=$(curl -s -w "\nHTTP_STATUS:%{http_code}" \
  -H "Authorization: Bearer $TOKEN_USER1" \
  -H "Content-Type: application/json" \
  "$BASE_URL$COMMUNITY_MEMBERS_ENDPOINT/$COMMUNITY_ID/members?limit=5&offset=0")

HTTP_STATUS2=$(echo "$RESPONSE2" | grep "HTTP_STATUS:" | cut -d: -f2)
BODY2=$(echo "$RESPONSE2" | sed '/HTTP_STATUS:/d')

echo "Status: $HTTP_STATUS2"
echo "Response: $BODY2"

if [ "$HTTP_STATUS2" = "200" ]; then
    echo -e "${GREEN}✅ Test 2 réussi: Pagination fonctionne${NC}"
else
    echo -e "${RED}❌ Test 2 échoué: Status $HTTP_STATUS2${NC}"
fi
echo

echo -e "${YELLOW}🔍 Test 3: Tentative d'accès par un non-membre${NC}"

RESPONSE3=$(curl -s -w "\nHTTP_STATUS:%{http_code}" \
  -H "Authorization: Bearer $TOKEN_NON_MEMBER" \
  -H "Content-Type: application/json" \
  "$BASE_URL$COMMUNITY_MEMBERS_ENDPOINT/$COMMUNITY_ID/members")

HTTP_STATUS3=$(echo "$RESPONSE3" | grep "HTTP_STATUS:" | cut -d: -f2)
BODY3=$(echo "$RESPONSE3" | sed '/HTTP_STATUS:/d')

echo "Status: $HTTP_STATUS3"
echo "Response: $BODY3"

if [ "$HTTP_STATUS3" = "403" ]; then
    echo -e "${GREEN}✅ Test 3 réussi: Non-membre correctement rejeté${NC}"
else
    echo -e "${RED}❌ Test 3 échoué: Status $HTTP_STATUS3 (attendu: 403)${NC}"
fi
echo

echo -e "${YELLOW}🔍 Test 4: Test avec filtres (rôle)${NC}"

RESPONSE4=$(curl -s -w "\nHTTP_STATUS:%{http_code}" \
  -H "Authorization: Bearer $TOKEN_USER1" \
  -H "Content-Type: application/json" \
  "$BASE_URL$COMMUNITY_MEMBERS_ENDPOINT/$COMMUNITY_ID/members?role=member&limit=10")

HTTP_STATUS4=$(echo "$RESPONSE4" | grep "HTTP_STATUS:" | cut -d: -f2)
BODY4=$(echo "$RESPONSE4" | sed '/HTTP_STATUS:/d')

echo "Status: $HTTP_STATUS4"
echo "Response: $BODY4"

if [ "$HTTP_STATUS4" = "200" ]; then
    echo -e "${GREEN}✅ Test 4 réussi: Filtrage par rôle fonctionne${NC}"
else
    echo -e "${RED}❌ Test 4 échoué: Status $HTTP_STATUS4${NC}"
fi
echo

echo -e "${YELLOW}🔍 Test 5: Test communauté inexistante${NC}"

FAKE_COMMUNITY_ID="00000000-0000-0000-0000-000000000000"
RESPONSE5=$(curl -s -w "\nHTTP_STATUS:%{http_code}" \
  -H "Authorization: Bearer $TOKEN_USER1" \
  -H "Content-Type: application/json" \
  "$BASE_URL$COMMUNITY_MEMBERS_ENDPOINT/$FAKE_COMMUNITY_ID/members")

HTTP_STATUS5=$(echo "$RESPONSE5" | grep "HTTP_STATUS:" | cut -d: -f2)
BODY5=$(echo "$RESPONSE5" | sed '/HTTP_STATUS:/d')

echo "Status: $HTTP_STATUS5"
echo "Response: $BODY5"

if [ "$HTTP_STATUS5" = "404" ]; then
    echo -e "${GREEN}✅ Test 5 réussi: Communauté inexistante correctement gérée${NC}"
else
    echo -e "${RED}❌ Test 5 échoué: Status $HTTP_STATUS5 (attendu: 404)${NC}"
fi
echo

echo -e "${YELLOW}🔍 Test 6: Test sans authentification${NC}"

RESPONSE6=$(curl -s -w "\nHTTP_STATUS:%{http_code}" \
  -H "Content-Type: application/json" \
  "$BASE_URL$COMMUNITY_MEMBERS_ENDPOINT/$COMMUNITY_ID/members")

HTTP_STATUS6=$(echo "$RESPONSE6" | grep "HTTP_STATUS:" | cut -d: -f2)
BODY6=$(echo "$RESPONSE6" | sed '/HTTP_STATUS:/d')

echo "Status: $HTTP_STATUS6"
echo "Response: $BODY6"

if [ "$HTTP_STATUS6" = "401" ]; then
    echo -e "${GREEN}✅ Test 6 réussi: Authentification requise${NC}"
else
    echo -e "${RED}❌ Test 6 échoué: Status $HTTP_STATUS6 (attendu: 401)${NC}"
fi
echo

echo "=== Résumé des tests ==="
echo -e "Test 1 (membre autorisé): ${HTTP_STATUS1}"
echo -e "Test 2 (pagination): ${HTTP_STATUS2}"
echo -e "Test 3 (non-membre): ${HTTP_STATUS3}"
echo -e "Test 4 (filtres): ${HTTP_STATUS4}"
echo -e "Test 5 (communauté inexistante): ${HTTP_STATUS5}"
echo -e "Test 6 (sans auth): ${HTTP_STATUS6}"
echo

# Calculer le score
TOTAL_TESTS=6
PASSED_TESTS=0

[ "$HTTP_STATUS1" = "200" ] && PASSED_TESTS=$((PASSED_TESTS + 1))
[ "$HTTP_STATUS2" = "200" ] && PASSED_TESTS=$((PASSED_TESTS + 1))
[ "$HTTP_STATUS3" = "403" ] && PASSED_TESTS=$((PASSED_TESTS + 1))
[ "$HTTP_STATUS4" = "200" ] && PASSED_TESTS=$((PASSED_TESTS + 1))
[ "$HTTP_STATUS5" = "404" ] && PASSED_TESTS=$((PASSED_TESTS + 1))
[ "$HTTP_STATUS6" = "401" ] && PASSED_TESTS=$((PASSED_TESTS + 1))

echo -e "${YELLOW}📊 Score: $PASSED_TESTS/$TOTAL_TESTS tests réussis${NC}"

if [ $PASSED_TESTS -eq $TOTAL_TESTS ]; then
    echo -e "${GREEN}🎉 Tous les tests ont réussi !${NC}"
    exit 0
else
    echo -e "${RED}❌ Certains tests ont échoué. Vérifiez l'implémentation.${NC}"
    exit 1
fi