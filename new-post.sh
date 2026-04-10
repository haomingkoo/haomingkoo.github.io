#!/bin/bash
# ─────────────────────────────────────────────────────────────────────
# Create a new blog or travel post
#
# Usage:
#   ./new-post.sh blog "My Post Title" "Building,FastAPI"
#   ./new-post.sh travel "5 Days in Tokyo" "Japan,Food" --lat 35.6762 --lng 139.6503
#
# This creates a post file from the template, adds it to posts.json,
# and regenerates the crawlable homepage/archive sections plus feed/sitemap.
# ─────────────────────────────────────────────────────────────────────
set -e

TYPE="${1:?Usage: ./new-post.sh <blog|travel> \"title\" \"tag1,tag2\" [--lat N --lng N]}"
TITLE="${2:?Provide a title}"
TAGS_RAW="${3:-General}"
DATE=$(date +%Y-%m-%d)
SLUG=$(echo "$TITLE" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g' | sed 's/--*/-/g' | sed 's/^-//' | sed 's/-$//')

# Parse optional lat/lng
LAT="" ; LNG=""
shift 3 2>/dev/null || true
while [[ $# -gt 0 ]]; do
  case "$1" in
    --lat) LAT="$2"; shift 2 ;;
    --lng) LNG="$2"; shift 2 ;;
    *) shift ;;
  esac
done

if [ "$TYPE" != "blog" ] && [ "$TYPE" != "travel" ]; then
  echo "Error: type must be 'blog' or 'travel'" ; exit 1
fi

POST_DIR="$TYPE/posts"
POST_FILE="$POST_DIR/$SLUG.html"
MANIFEST="$TYPE/posts.json"

if [ -f "$POST_FILE" ]; then
  echo "Error: $POST_FILE already exists" ; exit 1
fi

# Convert comma-separated tags to JSON array
TAGS_JSON=$(echo "$TAGS_RAW" | python3 -c "
import sys, json
tags = [t.strip() for t in sys.stdin.read().strip().split(',') if t.strip()]
print(json.dumps(tags))
")

# Choose template
if [ "$TYPE" = "travel" ]; then
  TEMPLATE="travel/_template.html"
else
  TEMPLATE="blog/posts/lionweather.html"
fi

# Copy template
cp "$TEMPLATE" "$POST_FILE"
echo "Created: $POST_FILE"

# Build JSON entry
ENTRY=$(python3 -c "
import json
entry = {
    'slug': '$SLUG',
    'title': '$TITLE',
    'date': '$DATE',
    'tags': $TAGS_JSON,
    'excerpt': 'Write a short excerpt here.',
    'cover': '',
    'readingTime': '5 min'
}
lat, lng = '$LAT', '$LNG'
if lat and lng:
    entry['lat'] = float(lat)
    entry['lng'] = float(lng)
print(json.dumps(entry))
")

# Add to posts.json
python3 -c "
import json, sys
with open('$MANIFEST', 'r') as f:
    posts = json.load(f)
new = json.loads('$ENTRY')
posts.insert(0, new)
with open('$MANIFEST', 'w') as f:
    json.dump(posts, f, indent=2)
"
echo "Updated: $MANIFEST"

# Refresh generated crawlable content + SEO artifacts
python3 "$(dirname "$0")/sync_site_content.py"
echo "Updated: homepage/archive fallback content, feed.xml, sitemap.xml"

echo ""
echo "Next steps:"
echo "  1. Edit $POST_FILE with your content"
echo "  2. Update the excerpt in $MANIFEST"
echo "  3. Re-run python3 sync_site_content.py after final title/excerpt edits"
echo "  4. git add $POST_FILE $MANIFEST index.html $TYPE/index.html feed.xml sitemap.xml"
echo "  5. git commit -m 'feat($TYPE): add $SLUG'"
echo "  6. git push"
echo ""
