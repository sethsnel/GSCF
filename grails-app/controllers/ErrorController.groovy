/**
 * Error Controller
 * @Author  Jeroen Wesbeek
 * @Since   20091019
 *
 * Revision information:
 * $Rev$
 * $Author$
 * $Date$
 */
public class ErrorController {
    /**
     * render the flash message
     */
    def index = {
	render('temp message');
    }
}