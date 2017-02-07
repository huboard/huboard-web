#!/usr/bin/env bash
cd /srv/huboard
alias i="bundle install"
alias s="bundle exec rails server --binding 0.0.0.0"

echo "
Welcome to Huboard!

1. If you haven't already, run 'i' to install dependencies.
2. Run 's' to start Rails.
3. Browse to http://localhost:3001/ from your host.
"
