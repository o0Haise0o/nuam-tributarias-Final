#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""
import os
import sys
import ssl

if not hasattr(ssl, 'wrap_socket'):
    def fix_ssl_wrap_socket(sock, keyfile=None, certfile=None, **kwargs):
        context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
        context.load_cert_chain(certfile, keyfile)
        return context.wrap_socket(sock, server_side=True)
    
    ssl.wrap_socket = fix_ssl_wrap_socket

def main():
    """Run administrative tasks."""
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'nuam_backend.settings')
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    execute_from_command_line(sys.argv)

if __name__ == '__main__':
    main()