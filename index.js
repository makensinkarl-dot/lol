 gopeed.events.onResolve(async function (ctx) {
    const urlOriginal = ctx.req.url;

    try {
        // 1. Obtenemos el HTML de la página del video
        const response = await fetch(urlOriginal);
        const html = await response.text();

        // 2. Buscamos la función específica del reproductor para calidad alta
        // La Regex busca: setVideoUrlHigh(' y captura todo hasta la siguiente comilla '
        const regexHigh = /setVideoUrlHigh\('([^']+)'\)/i;
        const coincidenciaHigh = html.match(regexHigh);

        if (coincidenciaHigh && coincidenciaHigh[1]) {
            const urlFinal = coincidenciaHigh[1]; // Este es el enlace .mp4 directo

            // 3. Obtenemos el título del video para guardarlo con ese nombre (Opcional pero útil)
            const regexTitle = /setVideoTitle\('([^']+)'\)/i;
            const coincidenciaTitle = html.match(regexTitle);
            let nombreVideo = coincidenciaTitle ? coincidenciaTitle[1] : "video_descargado";

            // Limpiamos caracteres que puedan dar error en el nombre del archivo
            nombreVideo = nombreVideo.replace(/[<>:"\/\\|?*]+/g, '_');

            // 4. Mandamos la orden a Gopeed
            ctx.res = {
                name: nombreVideo,
                files: [
                    {
                        name: `${nombreVideo}.mp4`,
                        req: {
                            url: urlFinal,
                            headers: {
                                "Referer": urlOriginal,
                                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
                            }
                        }
                    }
                ]
            };
        } else {
            throw new Error("No se pudo encontrar la URL de alta calidad en el código.");
        }
    } catch (error) {
        ctx.res = {
            error: error.message
        };
    }
});
