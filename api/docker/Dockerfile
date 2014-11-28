FROM tutum/lamp:latest
RUN rm -rf app && git clone https://github.com/29th/personnel-api.git /app
RUN cd /app && ./bootstrap.sh
EXPOSE 80 3306
CMD ["/run.sh"]
