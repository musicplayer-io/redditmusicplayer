#zip all files to nw archive

cd ../../app/
zip -r redditmusicplayer.nw *

#copy nw.pak from current build node-webkit
cp /opt/node-webkit/nw.pak ./nw.pak

#compilation to executable form
cat /opt/node-webkit/nw ./redditmusicplayer.nw > ../build/linux/redditmusicplayer && chmod +x ../build/linux/redditmusicplayer

#move nw.pak to build folder
mv ./nw.pak ../build/linux/nw.pak
rm ./redditmusicplayer.nw

#run application
cd ../build/linux
./redditmusicplayer
