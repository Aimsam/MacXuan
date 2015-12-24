export:
	rsync -avz --exclude 'Resources'  --exclude '.git' --exclude 'node-webkit.app' --exclude 'Makefile' --delete-excluded . ../lifestealer_release
	cp Resources/macxuan.icns ../lifestealer_release/