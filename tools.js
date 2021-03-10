const {readFile} = require('fs')

/**
 * Turns any text into a valid path or filename fragment
 * @param text Text to remove special chars from
 * @returns {string} The slug
 */
const slugify = text =>
    text
        .toString()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]+/g, '')
        .replace(/--+/g, '-')

/**
 * Reads a list of files asynchronously in recursive fashion
 * @param files String array with fully qualified file names
 * @param options Nodejs read options, see readFile
 * @param callback A callback function (error, object) => void getting an object with all file names (keys)
 * and file content (values)
 */
function readAllFiles(files, options, callback) {
    if (files.length < 1) {
        callback(undefined, {});
    } else {
        const [first, ...rest] = files;
        readFile(first, options, (error, content) => {
            if (error) {
                callback(error, undefined);
            } else {
                readAllFiles(rest, options, (error, contents) => callback(error, error ? undefined : {[first]: content, ...contents}));
            }
        })
    }
}

module.exports = {slugify, readAllFiles}
