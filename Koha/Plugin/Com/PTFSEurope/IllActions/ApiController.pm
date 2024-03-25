package Koha::Plugin::Com::PTFSEurope::IllActions::ApiController;

# This file is part of Koha.
#
# Koha is free software; you can redistribute it and/or modify it under the
# terms of the GNU General Public License as published by the Free Software
# Foundation; either version 3 of the License, or (at your option) any later
# version.
#
# Koha is distributed in the hope that it will be useful, but WITHOUT ANY
# WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR
# A PARTICULAR PURPOSE.  See the GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License along
# with Koha; if not, write to the Free Software Foundation, Inc.,
# 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.

use Modern::Perl;

use Mojo::Base 'Mojolicious::Controller';

=head1 API

=head2 Class Methods

=head3 new_request_for_patron

Redirects to ILL create form with a specific patron predefined

=cut

sub new_request_for_patron {
    my $c = shift->openapi->valid_input or return;

    my $illrequest = Koha::ILL::Requests->find( $c->param('ill_request_id') );
    my $patron     = Koha::Patrons->find( $illrequest->borrowernumber );

    return $c->redirect_to( "/cgi-bin/koha/ill/ill-requests.pl?method=create&backend="
            . $illrequest->backend
            . "&cardnumber="
            . $patron->cardnumber );
}

=head3 get_branchcode_from_cardnumber

Returns the corresponding patron's library given their cardnumber

=cut

sub get_branchcode_from_cardnumber {
    my $c = shift->openapi->valid_input or return;

    my $patron = Koha::Patrons->find( { cardnumber => $c->param('cardnumber') } );

    unless ($patron) {
        return $c->render(
            status  => '404',
            openapi =>
                { errors => [ { message => "Patron not found for given cardnumber " . $c->param('cardnumber') } ] }
        );
    }

    return $c->render(
        status  => '200',
        openapi => $patron->branchcode
    );
}

1;
