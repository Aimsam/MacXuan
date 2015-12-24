#!/bin/bash


p_session="$HOME/var/cache/aria2/session.lock"
p_pid="$HOME/var/run/aria2.pid"
p_log="$HOME/var/log/aria2.log"

[[ -f $p_pid ]] && PID=$(cat $p_pid)
[[ -d /proc/$PID ]] || PID=""
[ ! -f $p_session ] && touch $p_session

case "$1" in
  start)
    stat_busy "Starting aria2 daemon"

    if [ -z "$PID" ]; then
      aria2c --enable-rpc --rpc-allow-origin-all --save-session $p_session --input-file $p_session $ARIA2C_ARG &> $p_log &
      echo $! > $p_pid
		else
			echo "${C_OTHER}SKIP${C_CLEAR} aria2 is already running."
    fi

    if [ $? -gt 0 ]; then
      stat_fail
    else
      add_daemon aria2
      stat_done
    fi
    ;;
  stop)
    stat_busy "Stopping aria2 daemon"

		if [ ! -z "$PID" ]; then
      kill $PID &> /dev/null
      rm $p_pid
		else
			echo "${C_OTHER}SKIP${C_CLEAR} aria2 is not running."
    fi

		if [ $? -gt 0 ]; then
			stat_fail
    else
      rm_daemon aria2
      stat_done
		fi
    ;;
  restart)
    $0 stop
    $0 start
    ;;
  *)
    echo "usage: $0 {start|stop|restart}"
esac
exit 0