# API Spring Boot — contexto = raíz del monorepo Jazuck/Despliegue-Sportster.
# Render: Root Directory VACÍO, runtime Docker, Dockerfile path "Dockerfile".
#
# La fuente se descarga del repo del API (público). Así no depende de que el
# submódulo se copie bien al contexto de Docker (evita "Dockerfile 2B" / carpeta vacía).
# Si SomosDeWeb/pi-25-26-backend-el-batallon es privado, hazlo público o vuelve a COPY local.

FROM eclipse-temurin:21-jdk-jammy AS build
WORKDIR /app

ARG BACKEND_TARBALL_URL=https://github.com/SomosDeWeb/pi-25-26-backend-el-batallon/archive/refs/heads/main.tar.gz
ADD ${BACKEND_TARBALL_URL} /tmp/backend.tgz

RUN mkdir /tmp/x \
  && tar -xzf /tmp/backend.tgz -C /tmp/x \
  && d="$(find /tmp/x -mindepth 1 -maxdepth 1 -type d | head -1)" \
  && test -n "$d" \
  && cp -a "${d}/." /app/ \
  && chmod +x mvnw \
  && ./mvnw -B -q -DskipTests package

FROM eclipse-temurin:21-jre-jammy
WORKDIR /app
COPY --from=build /app/target/Sportster-0.0.1-SNAPSHOT.jar /app/app.jar
EXPOSE 8080
ENV JAVA_TOOL_OPTIONS="-XX:MaxRAMPercentage=70.0"
ENTRYPOINT ["sh", "-c", "exec java -Dserver.port=${PORT:-8080} -jar /app/app.jar"]
