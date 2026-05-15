# API Spring Boot — raíz del monorepo Jazuck/Despliegue-Sportster.
# Render: Root Directory VACÍO, Dockerfile path "Dockerfile", runtime Docker.
# Código en pi-25-26-backend-el-batallon/ dentro del mismo repo (sin submódulo).

FROM eclipse-temurin:21-jdk-jammy AS build
WORKDIR /app
COPY pi-25-26-backend-el-batallon/pom.xml .
COPY pi-25-26-backend-el-batallon/mvnw .
COPY pi-25-26-backend-el-batallon/.mvn .mvn
RUN chmod +x mvnw
COPY pi-25-26-backend-el-batallon/src src
RUN ./mvnw -B -q -DskipTests package

FROM eclipse-temurin:21-jre-jammy
WORKDIR /app
COPY --from=build /app/target/Sportster-0.0.1-SNAPSHOT.jar /app/app.jar
EXPOSE 8080
ENV JAVA_TOOL_OPTIONS="-XX:MaxRAMPercentage=70.0"
ENTRYPOINT ["sh", "-c", "exec java -Dserver.port=${PORT:-8080} -jar /app/app.jar"]
