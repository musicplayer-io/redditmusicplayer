rem zip all files without git to zip archive -2 compression methods - fast (-mx0) or strong (-mx9)
7z.exe a -tzip redditmusicplayer.nw ..\..\app\* -xr!?git\* -mx0

rem copy nw.pak from current build node-webkit to current (%~dp0) folder
copy c:\tools\node-webkit\nw.pak nw.pak

rem copy icudt.dll from current build node-webkit
copy c:\tools\node-webkit\icudt.dll icudt.dll

rem compilation to executable form
copy /b c:\tools\node-webkit\nw.exe+%~dp0redditmusicplayer.nw redditmusicplayer.exe

rem remove redditmusicplayer.nw
del redditmusicplayer.nw

rem run application
redditmusicplayer.exe