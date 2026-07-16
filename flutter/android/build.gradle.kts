allprojects {
    repositories {
        google()
        mavenCentral()
        maven {
            url = uri("https://api.mapbox.com/downloads/v2/releases/maven")
            credentials {
                // Toujours `mapbox` (pas votre nom d'utilisateur)
                username = "mapbox"
                password = (project.findProperty("MAPBOX_SECRET_KEY") as String?)
                    ?: System.getenv("MAPBOX_DOWNLOADS_TOKEN")
                    ?: run {
                        val envFile = rootProject.file("../.env")
                        if (envFile.exists()) {
                            envFile.readLines()
                                .firstOrNull { it.startsWith("MAPBOX_SECRET_KEY=") }
                                ?.substringAfter("=") ?: ""
                        } else ""
                    }
            }
            authentication { create<BasicAuthentication>("basic") }
        }
    }
}

val newBuildDir: Directory =
    rootProject.layout.buildDirectory
        .dir("../../build")
        .get()
rootProject.layout.buildDirectory.value(newBuildDir)

subprojects {
    val newSubprojectBuildDir: Directory = newBuildDir.dir(project.name)
    project.layout.buildDirectory.value(newSubprojectBuildDir)
}
subprojects {
    project.evaluationDependsOn(":app")
}

tasks.register<Delete>("clean") {
    delete(rootProject.layout.buildDirectory)
}
